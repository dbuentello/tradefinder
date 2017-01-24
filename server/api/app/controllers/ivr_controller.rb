class IvrController < ApplicationController

  def ivr
    if params[:symbol].nil?
      message = 'Symbol not set'
    else
      max = Volatility
                .where(symbol: params[:symbol])
                .where("vol >= 0")
                .where("date >= ?", (Date.today - 365))
                .order(:vol).last
      min = Volatility
                .where(symbol: params[:symbol])
                .where("vol >= 0")
                .where("date >= ?", (Date.today - 365))
                .order(:vol).first
      last = Volatility
                 .where(symbol: params[:symbol])
                 .order(:date).last

      @ivr = (last.vol - min.vol) / (max.vol - min.vol)
      @last_ivr_date = last.date.to_date
    end

    respond_to do |format|
      format.html
      format.json {
        render json: {
          :message => message,
          :ivr => @ivr,
          :max_iv => max.vol,
          :max_iv_date => max.date.to_date,
          :min_iv => min.vol,
          :min_iv_idate => min.date.to_date,
          :last_iv => last.vol,
          :last_ivr_date => @last_ivr_date
        }
      }
    end
  end

end
