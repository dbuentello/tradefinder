require "#{Rails.root}/lib/ameritrade_helper"

class StockOptionsController < ApplicationController
  include AmeritradeHelper

  before_action :set_stock_option, only: [:show, :edit, :update, :destroy]

  # GET /stock_options
  # GET /stock_options.json
  def index
    headers['Last-Modified'] = Time.now.httpdate
    session_id = nil

    if !params[:symbols].nil?
      syms = params[:symbols].split(",")
      # @stock_options = StockOption.where(symbol: syms)
      @stock_options = []

      login_response = AmeritradeHelper.login(params)
      puts "*** login response #{login_response}"
      unless login_response.nil?
        session_id = login_response[:session_id]
        login_date = login_response[:login_date]
      end

      if !session_id.nil?
        syms.each do |sym|
          new_stock_options = AmeritradeHelper.get_stock_option_symbol(sym, !params[:historic].nil?, params, session)
          @stock_options = @stock_options + new_stock_options unless new_stock_options.nil? || !new_stock_options.length
        end
      else
        puts "*** session id is nil"
      end

    else
      @stock_options = StockOption.all
    end

    response = {
        :meta => {
            # :session_id => session_id,
            # :login_date => login_date
        },
        :data => {
            # :stock_options => @stock_options
        }
    }

    respond_to do |format|
      format.html
      format.json { render json: response }
    end

    # @stock_options = StockOption.all
  end

  # GET /stock_options/1
  # GET /stock_options/1.json
  def show
  end

  # GET /stock_options/new
  def new
    @stock_option = StockOption.new
  end

  # GET /stock_options/1/edit
  def edit
  end

  # POST /stock_options
  # POST /stock_options.json
  def create
    @stock_option = StockOption.new(stock_option_params)

    respond_to do |format|
      if @stock_option.save
        format.html { redirect_to @stock_option, notice: 'Stock option was successfully created.' }
        format.json { render :show, status: :created, location: @stock_option }
      else
        format.html { render :new }
        format.json { render json: @stock_option.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /stock_options/1
  # PATCH/PUT /stock_options/1.json
  def update
    respond_to do |format|
      if @stock_option.update(stock_option_params)
        format.html { redirect_to @stock_option, notice: 'Stock option was successfully updated.' }
        format.json { render :show, status: :ok, location: @stock_option }
      else
        format.html { render :edit }
        format.json { render json: @stock_option.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /stock_options/1
  # DELETE /stock_options/1.json
  def destroy
    @stock_option.destroy
    respond_to do |format|
      format.html { redirect_to stock_options_url, notice: 'Stock option was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_stock_option
      @stock_option = StockOption.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def stock_option_params
      params.require(:stock_option).permit(:symbol, :description, :strike, :call, :mark, :last, :bid, :ask, :theoPrice, :openInterest, :volume, :iv, :percentFromMarket, :probOTM, :delta, :gamma, :theta, :vega, :daysToExpiration, :expiration)
    end
end
