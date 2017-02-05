module AmeritradeHelper

  # TODO
  # Fix bug where last quote repeats in output
  # Start on stock options

  def self.get_stock_symbol(symbol, historic, params, session_id)
    # Try to use a cached entry
    stock = self.get_cached_for_symbol(symbol) if !historic
    puts "*** using existing stock for #{symbol}" if !stock.nil? and !historic

    stocks = []
    if stock.nil?
      stock_datas = nil
      if historic
        puts "*** getting historic stock #{symbol} from server"
        datas = self.get_historic_stock_quote(symbol)
        stock_datas = datas if !datas.nil? && datas.length
      else
        puts "*** getting stock #{symbol} from server"
        data = self.get_stock_quote(symbol)
        puts "*** got stock datas: #{data}"
        stock_datas = [data] if !data.nil?
      end

      unless stock_datas.nil?
        # puts "*** got stocks #{stock_datas}"

        if params[:delete_existing]
          stock_datas.each do |stock_data|
            self.delete_stock_quotes_on_date(symbol, stock_data[:date]) if !delete_existing_days_quotes.nil?
          end
        end

        Stock.import stock_datas
        stocks = stocks + Stock.where(symbol: symbol)
      end
    else
      stocks.push(stock)
    end

    puts "*** returning stocks: #{stocks}"
    return stocks
  end

  def self.get_stock_option_symbol(symbol, historic, minDays, maxDays)
    # Get expiration months from min/max days
    expirations = []
    if !minDays.nil? && !maxDays.nil?
      minDays = minDays.to_i
      maxDays = maxDays.to_i
      minDate = (Date.today + minDays.day)
      maxDate = (Date.today + maxDays.day)
      minDateMonth = minDate.month.to_i
      maxDateMonth = maxDate.month.to_i

      (minDateMonth...maxDateMonth + 1).each do |month|
        if(month == Date.today.month && (Date.today.cweek < 3 || (Date.today.cweek == 3 && Date.today.wday <= 5)))
          next
        end

        # TODO - handle year rolling over!!!
        str = "#{minDate.year}#{(month < 10 ? '0' : '')}#{month}"
        expirations.push(str) if !expirations.include?(str)
      end
    else
      expirations.push('A')
    end
    puts "*** exp strs: #{expirations}"


    # Try to use a cached entry
    options = expirations.include?('A') ? [] : self.get_cached_options_for_symbol(symbol, expirations)
    if(options.size > 0)
      puts "*** using existing stock options for #{symbol}"
      return options
    end

    OptionQueryCache.where(symbol: symbol).delete_all
    OptionQueryCache.new({ :symbol => symbol, :expirations => expirations }).save
    AmeritradeHelper.delete_stock_options(symbol)

    options = []
    expirations.each do |expYYYYMM|
      options = options + self.get_stock_option_quote(symbol, expYYYYMM)
    end

    StockOption.import options

    return options
  end

  def self.load_volatility(symbol, params, session_id)
    return if self.check_vol_query_cache(symbol)

    # Figure out which vol dates that we need
    query_dates = []
    gap_dates = self.get_vol_gap_dates(symbol)

    next_date = nil
    gap_dates.each do |gap_date|
      if next_date.nil? || gap_date <= next_date
        query_dates.push(gap_date)
        next_date = gap_date - 10
      end
    end

    puts "*** query dates #{query_dates}"

    # Query the API for any vol dates that we don't have
    new_vols = []
    query_dates.each do |query_date|
      vols = self.get_volatility_quote(symbol, query_date)
      new_vols = new_vols + vols
    end

    # puts "*** vols: #{new_vols.count} - #{new_vols}"

    # Save the queried vol values to the DB
    new_vols.each do |vol|
      self.delete_volatility(symbol, vol)
      # puts "#{vol.to_s}"
    end

    VolQueryCache.where(symbol: symbol).delete_all
    VolQueryCache.new({ :symbol => symbol }).save

    Volatility.import new_vols

    # Return all vols for the last year
    # return Volatility
    #            .where(symbol: symbol)
    #            .where("date >= ?", (Date.today - 365))
    #            .order(date: :desc)
    #
    # return self.calculate_ivr(symbol)
  end

  def self.calculate_ivr(symbol)
    max = Volatility
              .where(symbol: symbol)
              .where("vol >= 0")
              .where("date >= ?", (Date.today - 365))
              .order(:vol).last
    min = Volatility
              .where(symbol: symbol)
              .where("vol >= 0")
              .where("date >= ?", (Date.today - 365))
              .order(:vol).first
    last = Volatility
               .where(symbol: symbol)
               .order(:date).last

    if !max.nil? && !min.nil? && !last.nil?
      ivr = (last.vol - min.vol) / (max.vol - min.vol)
      last_ivr_date = last.date.to_date

      return {
          :ivr => ivr,
          :max_iv => max.vol,
          :max_iv_date => max.date.to_date,
          :min_iv => min.vol,
          :min_iv_date => min.date.to_date,
          :last_iv => last.vol,
          :last_iv_date => last_ivr_date
      }
    end

    return {}
  end

  def self.login(params)
    # Check if we're already logged in, but no more than 5 minutes ago
    if !@session_id.nil?
      session_id = params[:session_id]
      login_date = params[:login_date]

      if !session_id.nil? and !login_date.nil?
        # date = DateTime.parse(login_date)
        date = login_date
        puts "*** comparing supplied date #{date} to 5 min ago #{DateTime.now.advance(:minutes => -5)}"
        if date > DateTime.now.advance(:minutes => -5)
          puts "*** re-using login session"
          return {
              :session_id => session_id,
              :login_date => login_date
          }
        end
      end
    end

    # Perform login
    url = "https://apis.tdameritrade.com/apps/100/LogIn?userid=#{ENV['AMERITRADE_USERNAME']}&password=#{ENV['AMERITRADE_PASSWORD']}&source=78812121212&version=1001"
    puts "*** loging into: #{url}"
    uri = URI.parse(url)
    https = Net::HTTP.new(uri.host,uri.port)
    https.use_ssl = true
    req = Net::HTTP::Post.new(uri, {'Content-Type' =>'application/x-www-form-urlencoded'})
    res = https.request(req)

    # Parse login response
    login_doc  = Nokogiri::XML(res.body)
    session_id_xml = login_doc.xpath("//xml-log-in/session-id")
    session_id_xml.each { |item| @session_id = item.content }

    puts "*** logged in with session id: #{@session_id}" if !@session_id.nil?
    puts "*** login failed" if @session_id.nil?

    return {
        :session_id => @session_id,
        :login_date => !@session_id.nil? ? DateTime.now : nil
    }
  end

  def self.delete_stock_options(symbol)
    StockOption
        .where(symbol: symbol)
        .delete_all
  end

  private

  #
  # API QUERIES
  #

  def self.query_xml_api(url)
    stock_uri = URI.parse(url)
    https = Net::HTTP.new(stock_uri.host,stock_uri.port)
    https.use_ssl = true
    req = Net::HTTP::Get.new(stock_uri)
    return https.request(req)
  end

  def self.query_binary_api(url)
    stock_uri = URI.parse(url)
    https = Net::HTTP.new(stock_uri.host,stock_uri.port)
    https.use_ssl = true
    req = Net::HTTP::Get.new(stock_uri)
    res = https.request(req)

    # File.open("/Users/KatieShaw/stock_response", 'w') { |file| file.write(res.body) }
    return res.body.bytes
  end


  #
  # SYMBOL QUERIES
  #

  def self.get_stock_quote(symbol)
    return nil if @session_id.nil? || symbol.nil?

    url = "https://apis.tdameritrade.com/apps/100/Quote;jsessionid=#{@session_id}?source=SMAR&symbol=#{symbol}"
    # puts "*** url: #{url}"

    stock_uri = URI.parse(url)
    https = Net::HTTP.new(stock_uri.host,stock_uri.port)
    https.use_ssl = true
    req = Net::HTTP::Get.new(stock_uri)
    res = https.request(req)
    # puts "*** response: #{res}"

    # Parse stock response
    stock_doc  = Nokogiri::XML(res.body)
    return self.parse_stock_data(stock_doc)
  end

  def self.get_historic_stock_quote(symbol)
    # puts "*** getting historic stock quote #{@session_id} #{symbol}"
    return nil if @session_id.nil? || symbol.nil?

    url = "https://apis.tdameritrade.com/apps/100/PriceHistory;jsessionid=#{@session_id}?source=SMAR" +
        "&requestidentifiertype=SYMBOL" +
        "&requestvalue=" + symbol +
        "&intervaltype=DAILY" +
        "&intervalduration=1" +
        "&periodtype=YEAR" +
        "&period=1" +
        "&enddate=" + DateTime.yesterday.strftime("%Y%m%d")
    "&enddate=" + DateTime.now.strftime("%Y%m%d")
    # "&requestidentifiertype=SYMBOL&requestvalue=AMTD&intervaltype=DAILY&intervalduration=1&startdate=20071122&enddate=20071126"
    # puts "*** url: #{url}"

    bytes = self.query_binary_api(url)
    return self.parse_historic_quotes(bytes)
  end

  def self.get_stock_option_quote(symbol, expYYYYMM)
    puts "*** getting stock option quote for #{symbol}"
    return [] if @session_id.nil? || symbol.nil?

    expYYYYMM = 'A' if expYYYYMM.nil?
    url = "https://apis.tdameritrade.com/apps/200/OptionChain;jsessionid=#{@session_id}?source=SMAR&symbol=#{symbol}&quotes=true&expire=#{expYYYYMM}"
    puts "*** url: #{url}"

    stock_uri = URI.parse(url)
    https = Net::HTTP.new(stock_uri.host,stock_uri.port)
    https.use_ssl = true
    req = Net::HTTP::Get.new(stock_uri)
    res = https.request(req)

    # Parse stock response
    stock_doc  = Nokogiri::XML(res.body)
    return self.parse_option_quotes(stock_doc)
  end

  def self.get_volatility_quote(symbol, gap_date)
    puts "*** getting volatility quote #{symbol}"
    return nil if @session_id.nil? || symbol.nil?

    # endDate = Date.today.prev_day

    # TODO - do I need to query for the previous day???
    # endDate = gap_date == Date.today ? gap_date.prev_day : gap_date
    endDate = gap_date
    if(endDate.wday == 0)
      endDate = endDate.prev_day(2)
    elsif(endDate.wday == 1)
      endDate = endDate.prev_day(3)
    elsif(endDate.wday == 6)
      endDate = endDate.prev_day(1)
    end

    url = "https://apis.tdameritrade.com/apps/100/VolatilityHistory;jsessionid=#{@session_id}?source=SMAR" +
        "&requestidentifiertype=SYMBOL" +
        "&requestvalue=" + symbol +
        "&intervaltype=DAILY" +
        "&intervalduration=1" +
        "&periodtype=DAY" +
        "&period=10" +
        "&enddate=" + endDate.strftime("%Y%m%d") +
        "&daystoexpiration=30" +
        "&volatilityhistorytype=I" +
        "&surfacetypeidentifier=DELTA" +
        "&surfacetypevalue=50";

    puts "*** url: #{url}"

    bytes = self.query_binary_api(url)
    return self.parse_volatility_quotes(bytes)
  end


  #
  # PARSING
  #

  def self.parse_historic_quotes(bytes)
    idx = 0
    # puts "*** response: #{bytes}"
    # puts "*** symbol count: #{self.get_integer(bytes[idx,4])}"
    symbol_len = self.get_integer(bytes[idx += 4,2])
    # puts "*** symbol length: #{symbol_len}"
    symbol = self.get_string(bytes[idx += 2,symbol_len])
    # puts "*** symbol: #{symbol}"
    error_code = self.get_integer(bytes[idx += symbol_len,1])
    # puts "*** error code: #{error_code}"
    bar_count = self.get_integer(bytes[idx += 1,4])
    # puts "*** bar count: #{bar_count}"

    stock_datas = []
    data_idx = idx += 4
    bar_count.times do |i|
      last = self.get_float(bytes[data_idx,4])
      # puts "\n*** close: #{bytes[data_idx,4]} #{last}"
      data_idx += 4

      high = self.get_float(bytes[data_idx,4])
      # puts "*** high: #{bytes[data_idx,4]} #{high}"
      data_idx += 4

      low = self.get_float(bytes[data_idx,4])
      # puts "*** low: #{bytes[data_idx,4]} #{low}"
      data_idx += 4

      open = self.get_float(bytes[data_idx,4])
      # puts "*** open: #{bytes[data_idx,4]} #{open}"
      data_idx += 4

      volume = self.get_float(bytes[data_idx,4])*100
      # puts "*** volume: #{bytes[data_idx,4]} #{volume}"
      data_idx += 4

      date = self.get_timestamp(bytes[data_idx,8])
      # puts "*** timestamp: #{bytes[data_idx,8]} #{date}"
      data_idx += 8

      stock_datas.push(
          {
              :symbol => symbol,
              :date => date,
              :last => last,
              :high => high,
              :low => low,
              :open => open,
              :volume => volume
          }
      )
    end

    return stock_datas
  end

  def self.parse_option_quotes(stock_xml_doc)
    options = []
    # puts "response: #{stock_xml_doc}"

    result = get_xml_value(stock_xml_doc, "//amtd/result")
    return options if result.nil? || result != "OK"

    symbol = get_xml_value(stock_xml_doc, "//amtd/option-chain-results/symbol")
    # puts "#{symbol}"

    stock_xml_doc.xpath("//amtd/option-chain-results/option-date").each do |option_date|
      next if option_date.xpath('expiration-type').text != 'R'

      # puts "  #{option_date.xpath('date').text}"
      # puts "  #{option_date.xpath('expiration-type').text}"
      # puts "  #{option_date.xpath('days-to-expiration').text}"

      option_date.xpath('option-strike').each do |strike|
        put = self.parse_quote_details(strike, 'put/')
        put[:symbol] = symbol
        put[:call] = false
        put[:daysToExpiration] = option_date.xpath('days-to-expiration').text
        put[:expiration] = option_date.xpath('date').text

        call = self.parse_quote_details(strike, 'call/')
        call[:symbol] = symbol
        call[:call] = true
        call[:daysToExpiration] = option_date.xpath('days-to-expiration').text
        call[:expiration] = option_date.xpath('date').text

        options.push(put)
        options.push(call)
      end
    end

    return options
  end

  def self.parse_quote_details(strike, type)
    # puts "    #{option.xpath('option-symbol').text}"
    # puts "    #{option.xpath('description').text}"
    # puts "    #{option.xpath('last').text}"
    # puts "    #{option.xpath('bid').text}"
    # puts "    #{option.xpath('ask').text}"
    # puts "    #{option.xpath('open-interest').text}"
    # puts "    #{option.xpath('volume').text}"
    # puts "    #{option.xpath('delta').text}"
    # puts "    #{option.xpath('gamma').text}"
    # puts "    #{option.xpath('theta').text}"
    # puts "    #{option.xpath('vega').text}"
    # puts "    #{option.xpath('implied-volatility').text}\n"

    return {
        # :option_symbol => strike.xpath(type + 'option-symbol').text,
        # :standard_option => strike.xpath('standard-option').text,
        :strike => strike.xpath('strike-price').text,
        :description => strike.xpath(type + 'description').text,
        :last => strike.xpath(type + 'last').text,
        :bid => strike.xpath(type + 'bid').text,
        :ask => strike.xpath(type + 'ask').text,
        # :optionInterest => strike.xpath(type + 'open-interest').text,
        :volume => strike.xpath(type + 'volume').text,
        :iv => strike.xpath(type + 'implied-volatility').text,
        :delta => strike.xpath(type + 'delta').text,
        :gamma => strike.xpath(type + 'gamma').text,
        :theta => strike.xpath(type + 'theta').text,
        :vega => strike.xpath(type + 'vega').text
    }
  end


  def self.parse_stock_data(stock_xml_doc)
    symbol = ''
    last = ''
    change_percent = ''

    result = get_xml_value(stock_xml_doc, "//amtd/result")
    return nil if result.nil? || result != "OK"

    # puts "response: #{stock_xml_doc}"

    symbol = get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/symbol")
    last = get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/last")
    change_percent = get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/change-percent")

    return nil if symbol.nil? || symbol.blank?
    return nil if last.nil? || last.blank?

    return {
        :symbol => symbol,
        :date => DateTime.now,
        :description => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/description"),
        :bid => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/bid"),
        :ask => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/ask"),
        :last => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/last"),
        :open => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/open"),
        :low => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/low"),
        :high => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/high"),
        :close => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/close"),
        :volume => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/volume"),
        :percentChange => get_xml_value(stock_xml_doc, "//amtd/quote-list/quote/change-percent")
    }
  end

  def self.parse_volatility_quotes(bytes)
    idx = 0
    puts "*** response: #{bytes}"

    # puts "*** symbol count: #{self.get_integer(bytes[idx,4])}"
    symbol_len = self.get_integer(bytes[idx += 4,2])
    # puts "*** symbol length: #{symbol_len}"
    symbol = self.get_string(bytes[idx += 2,symbol_len])
    # puts "*** symbol: #{symbol}"
    error_code = self.get_integer(bytes[idx += symbol_len,1])
    # puts "*** error code: #{error_code}"
    bar_count = self.get_integer(bytes[idx += 1,4])
    # puts "*** bar count: #{bar_count}"

    vols = []
    if bar_count.nil? || !(bar_count.is_a? Numeric)
      puts "*** Error getting volatility"
      return vols
    end

    data_idx = idx += 4
    bar_count.times do |i|
      vol = self.get_float(bytes[data_idx,4])
      # puts "\n*** vol: #{bytes[data_idx,4]} #{vol}"
      data_idx += 4

      date = self.get_timestamp(bytes[data_idx,8])
      # puts "*** timestamp: #{bytes[data_idx,8]} #{date}"
      data_idx += 8

      vols.push(
          {
              :symbol => symbol,
              :date => date,
              :vol => vol
          }
      )
    end

    return vols
  end



  #
  # DB QUERIES
  #

  def self.delete_stock_quotes_on_date(symbol, date)
    # puts "*** deleting symbol: #{symbol} for date: #{date}"
    # date = DateTime.parse(date_str)
    Stock
        .where(symbol: symbol)
        .where("date >= ?", date.beginning_of_day)
        .where("date <= ?", date.end_of_day)
        .delete_all
  end


  def self.get_cached_for_symbol(symbol)
    existings = Stock.where(symbol: symbol).order(created_at: :desc)
    if existings.size > 0
      existing = existings.first
      created_at = existing.created_at.to_s
      date = DateTime.parse(created_at)
      # date = DateTime.parse("2016-12-12")
      now = DateTime.now

      diff_minutes = (now.to_f - date.to_f) / 60
      puts "*** comparing: #{now.to_s} and #{date.to_s}"
      puts "*** diff in minutes: #{diff_minutes}"

      use_existing = false
      # if diff_minutes < Rails.application.config.max_cache_age
      if same_day(now, date) && date.hour > 16
        use_existing = true
      end

      if use_existing
        puts "*** using cached stock #{existing} created at: #{created_at} / #{date.to_s}"
        return existing;
      end
    end

    # puts "*** cache miss"
    return nil
  end

  def self.get_cached_options_for_symbol(symbol, expirations)
    # only return cached options if options were found for each expiration month
    puts "*** getting cached options #{symbol} #{expirations}"

    cache = OptionQueryCache.find_by(symbol: symbol)
    if !cache.nil?
      cache_exps = eval(cache.expirations)
      puts "*** comparing option cache exps: #{cache_exps} #{expirations}"
      if cache_exps == expirations
        now = DateTime.now
        puts "*** option cache exps are equal"

        if same_day(now, cache.created_at)
          if now.hour > 16 || (now.minute - cache.created_at.min) <= 5
            return StockOption.where(symbol: symbol)
          else
            puts "*** option cache over 5 minutes old"
          end
        else
          puts "*** option cache not same day"
        end
      end
    end

    return []
  end

  def self.delete_volatility(symbol, vol_data)
    unless vol_data.nil?
      Volatility
          .where(symbol: symbol)
          .where("date >= ?", vol_data[:date].beginning_of_day)
          .where("date <= ?", vol_data[:date].end_of_day)
          .delete_all
    end
  end

  def self.check_vol_query_cache(symbol)
    puts "*** checking cached vol #{symbol}"
    cache = VolQueryCache.find_by(symbol: symbol)
    if !cache.nil?
      now = DateTime.now
      if same_day(now, cache.created_at)
        # if now.hour > 16 || (now.minute - cache.created_at.min) <= 5
        puts "*** vol cache found"
        return true
        # else
        #   puts "*** vol cache over 5 minutes old"
        # end
      else
        puts "*** vol cache not same day"
      end
    end

    return false
  end

  def self.get_vol_gap_dates(symbol)
    gap_dates = []
    weekdays = self.get_prev_year_weekdays
    weekdays.each do |wd|
      existing = Volatility
                     .where(symbol: symbol)
                     .where("date >= ?", wd.beginning_of_day)
                     .where("date <= ?", wd.end_of_day)
      gap_dates.push(wd) if existing.nil? || existing.length == 0
    end
    puts "*** gap dates: #{gap_dates}"
    return gap_dates
  end


  #
  # UTILITIES
  #

  def self.get_string(bytes)
    return (bytes.map{|x|x.chr}).join if bytes
  end

  def self.get_integer(bytes)
    return bytes.map{|x|"%08b" % x}.join.to_i(2) if bytes
  end

  def self.get_float(bytes)
    return [bytes.map{|x|"%08b" % x}.join].pack('B*').unpack('g').first if bytes
  end

  def self.get_timestamp(bytes)
    return DateTime.strptime((self.get_integer(bytes)/1000).to_s, '%s') if bytes
  end

  def self.get_xml_value(doc, path)
    val = nil;
    doc.xpath(path).each { |item| val = item.content } unless doc.nil? || path.nil?
    val
  end

  def self.same_day(date1, date2)
    puts "*** same day check comparing: #{date1} #{date2}"
    return date1.year == date2.year &&
        date1.mon == date2.mon &&
        date1.mday == date2.mday
  end

  def self.get_prev_year_weekdays()
    date = Date.today - 1
    weekdays = []

    365.times do |i|
      if(date.wday >=1 && date.wday <= 5 && !self.is_holiday(date)) # 0 = Sunday
        weekdays.push(date)
      end
      date = date.prev_day
    end

    # weekdays.each do |wd|
    #   puts "#{wd.to_s}\n"
    # end

    return weekdays
  end

  def self.is_holiday(date)
    if (date == Date.parse('20160101') || date == Date.parse('20160118') || date == Date.parse('20160215') || date == Date.parse('20160325') ||
        date == Date.parse('20160530') || date == Date.parse('20160704') || date == Date.parse('20160905') || date == Date.parse('20161124')  ||
        date == Date.parse('20161226') || date == Date.parse('20170102') || date == Date.parse('20170116') || date == Date.parse('20170220') ||
        date == Date.parse('20170414') || date == Date.parse('20170529') || date == Date.parse('20170704') || date == Date.parse('20170904') ||
        date == Date.parse('20171123') || date == Date.parse('20171225'))
      return true
    end
    # return false
  end

end