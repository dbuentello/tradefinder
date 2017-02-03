require "#{Rails.root}/lib/ameritrade_helper"

class StocksController < ApplicationController
  include AmeritradeHelper

  before_action :set_stock, only: [:show, :edit, :update, :destroy]

  # GET /stocks
  # GET /stocks.json
  def index
    headers['Last-Modified'] = Time.now.httpdate
    session_id = nil

    if !params[:symbols].nil?
      syms = params[:symbols].split(",")
      @stocks = params[:latest] ? [] : Stock.where(symbol: syms)

      login_response = AmeritradeHelper.login(params)
      puts "*** login response #{login_response}"
      unless login_response.nil?
        session_id = login_response[:session_id]
        login_date = login_response[:login_date]
      end

      if !session_id.nil?
        syms.each do |sym|
          new_stocks = AmeritradeHelper.get_stock_symbol(sym, !params[:historic].nil?, params, session)
          @stocks = @stocks + new_stocks unless new_stocks.nil? || !new_stocks.length
        end
      else
        puts "*** session id is nil"
      end

    else
        @stocks = Stock.all
    end

    response = {
        :meta => {
            :session_id => session_id,
            :login_date => login_date
        },
        :data => {
            # :stocks => @stocks.sort_by &:date
            # :stocks => @stocks.order(:date)
            :stocks => @stocks
        }
    }

    respond_to do |format|
      format.html
      format.json { render json: response }
    end
  end

  # GET /stocks/1
  # GET /stocks/1.json
  def show
  end

  # GET /stocks/new
  # def new
  #   if params[:symbols].nil?
  #     @message = 'Symbols not specified'
  #     return
  #   end
  #
  #   @stock = AmeritradeHelper.get_stock_symbol(params[:symbol])
  # end

  # GET /stocks/1/edit
  def edit
  end

  # POST /stocks
  # POST /stocks.json
  # def create
  #   @stock = Stock.new(stock_params)
  #
  #   respond_to do |format|
  #     if @stock.save
  #       format.html { redirect_to @stock, notice: 'Stock was successfully created.' }
  #       format.json { render :show, status: :created, location: @stock }
  #     else
  #       format.html { render :new }
  #       format.json { render json: @stock.errors, status: :unprocessable_entity }
  #     end
  #   end
  # end

  # PATCH/PUT /stocks/1
  # PATCH/PUT /stocks/1.json
  # def update
  #   respond_to do |format|
  #     if @stock.update(stock_params)
  #       format.html { redirect_to @stock, notice: 'Stock was successfully updated.' }
  #       format.json { render :show, status: :ok, location: @stock }
  #     else
  #       format.html { render :edit }
  #       format.json { render json: @stock.errors, status: :unprocessable_entity }
  #     end
  #   end
  # end

  # DELETE /stocks/1
  # DELETE /stocks/1.json
  # def destroy
  #   @stock.destroy
  #   respond_to do |format|
  #     format.html { redirect_to stocks_url, notice: 'Stock was successfully destroyed.' }
  #     format.json { head :no_content }
  #   end
  # end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_stock
      @stock = Stock.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def stock_params
      params.fetch(:stock, {})
    end

end
