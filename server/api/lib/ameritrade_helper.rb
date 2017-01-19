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
        stock_datas = [data] if !data.nil?
      end

      unless stock_datas.nil?
        # puts "*** got stocks #{stock_datas}"
        stock_datas.each do |stock_data|
          stock = self.save_stock(symbol, stock_data, params[:delete_existing])
          stocks.push(stock) if stock
        end
      end
    else
      stocks.push(stock)
    end

    # puts "*** returning stocks: #{stocks}"
    return stocks
  end

  def self.get_stock_option_symbol(symbol, historic, params, session_id)
    # Try to use a cached entry
    # stock = self.get_cached_for_symbol(symbol) if !historic
    # puts "*** using existing stock option for #{symbol}" if !stock.nil? and !historic

    stocks = []

    options = self.get_stock_option_quote(symbol)
    options.each { |option| puts "#{option.to_s}" }

    # if stock.nil?
    #   stock_datas = nil
    #   if historic
    #     puts "*** getting historic stock #{symbol} from server"
    #     datas = self.get_historic_stock_quote(symbol)
    #     stock_datas = datas if !datas.nil? && datas.length
    #   else
    #     puts "*** getting stock #{symbol} from server"
    #     data = self.get_stock_quote(symbol)
    #     stock_datas = [data] if !data.nil?
    #   end
    #
    #   unless stock_datas.nil?
    #     # puts "*** got stocks #{stock_datas}"
    #     stock_datas.each do |stock_data|
    #       stock = self.save_stock(symbol, stock_data, params[:delete_existing])
    #       stocks.push(stock) if stock
    #     end
    #   end
    # else
    #   stocks.push(stock)
    # end

    # puts "*** returning stocks: #{stocks}"
    return stocks
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

  def self.get_stock_option_quote(symbol)
    puts "*** getting stock option quote for #{symbol}"
    return nil if @session_id.nil? || symbol.nil?

    url = "https://apis.tdameritrade.com/apps/200/OptionChain;jsessionid=#{@session_id}?source=SMAR&symbol=#{symbol}&quotes=true"
        # + "&expire=" + expStr
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
    return nil if result.nil? || result != "OK"

    symbol = get_xml_value(stock_xml_doc, "//amtd/option-chain-results/symbol")
    # puts "#{symbol}"

    stock_xml_doc.xpath("//amtd/option-chain-results/option-date").each do |option_date|
      # puts "  #{option_date.xpath('date').text}"
      # puts "  #{option_date.xpath('expiration-type').text}"
      # puts "  #{option_date.xpath('days-to-expiration').text}"

      option_date.xpath('option-strike').each do |strike|
        put = self.parse_quote_details(strike, 'put/')
        put[:symbol] = symbol
        put[:daysToExpiration] = option_date.xpath('days-to-expiration').text
        put[:expiration] = option_date.xpath('date').text

        call = self.parse_quote_details(strike, 'call/')
        call[:symbol] = symbol
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
        :option_symbol => strike.xpath(type + 'option-symbol').text,
        :standard_option => strike.xpath('standard-option').text,
        :strike => strike.xpath('strike-price').text,
        :description => strike.xpath(type + 'description').text,
        :last => strike.xpath(type + 'last').text,
        :bid => strike.xpath(type + 'bid').text,
        :ask => strike.xpath(type + 'ask').text,
        :optionInterest => strike.xpath(type + 'open-interest').text,
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


  #
  # DB QUERIES
  #

  def self.save_stock(symbol, stock_data, delete_existing_days_quotes)
    unless stock_data.nil? || stock_data[:symbol].nil?
      # puts "*** saving stock data: #{stock_data} to DB"
      self.delete_stock_quotes_on_date(symbol, stock_data[:date]) if !delete_existing_days_quotes.nil?
      stock = Stock.new(stock_data)
      stock.save
      return stock
    end

    return nil
  end

  def self.delete_stock_quotes_on_date(symbol, date)
    # puts "*** deleting symbol: #{symbol} for date: #{date}"
    # date = DateTime.parse(date_str)
    Stock
        .where(symbol: symbol)
        .where("date >= ?", date.beginning_of_day)
        .where("date <= ?", date.end_of_day)
        .destroy_all
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
      # puts "*** comparing: #{now.to_s} and #{date.to_s}"
      # puts "*** diff in minutes: #{diff_minutes}"

      use_existing = false
      # if diff_minutes < Rails.application.config.max_cache_age
      # if same_day(now, date) && date.hour > 16
      #   use_existing = true
      # end

      if use_existing
        # puts "Using cached stock #{existing} created at: #{created_at} / #{date.to_s}"
        return existing;
      end
    end

    # puts "*** cache miss"
    return nil
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
    return date1.year == date2.year &&
        date1.mon == date2.mon &&
        date1.mday == date2.mday
  end

end