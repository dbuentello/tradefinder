require "#{Rails.root}/lib/ameritrade_helper"

class VolatilitiesController < ApplicationController
  before_action :set_volatility, only: [:show, :edit, :update, :destroy]

  # GET /volatilities
  # GET /volatilities.json
  def index
    headers['Last-Modified'] = Time.now.httpdate
    session_id = nil
    @volatilities = []

    if !params[:symbols].nil?
      syms = params[:symbols].split(",")

      login_response = AmeritradeHelper.login(params)
      puts "*** login response #{login_response}"
      unless login_response.nil?
        session_id = login_response[:session_id]
        login_date = login_response[:login_date]
      end

      if !session_id.nil?
        syms.each do |sym|
          vols = AmeritradeHelper.get_volatility(sym, params, session)
          @volatilities = @volatilities + vols if !vols.nil?
        end
      else
        puts "*** session id is nil"
      end

    else
      @volatilities = Volatility.all
    end

    response = {
        :meta => {
            :session_id => session_id,
            :login_date => login_date
        },
        :data => {
            :volatilites => @volatilities
        }
    }

    respond_to do |format|
      format.html
      format.json { render json: response }
    end


    # @volatilities = Volatility.all
  end

  # GET /volatilities/1
  # GET /volatilities/1.json
  def show
  end

  # GET /volatilities/new
  def new
    @volatility = Volatility.new
  end

  # GET /volatilities/1/edit
  def edit
  end

  # POST /volatilities
  # POST /volatilities.json
  def create
    @volatility = Volatility.new(volatility_params)

    respond_to do |format|
      if @volatility.save
        format.html { redirect_to @volatility, notice: 'Volatility was successfully created.' }
        format.json { render :show, status: :created, location: @volatility }
      else
        format.html { render :new }
        format.json { render json: @volatility.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /volatilities/1
  # PATCH/PUT /volatilities/1.json
  def update
    respond_to do |format|
      if @volatility.update(volatility_params)
        format.html { redirect_to @volatility, notice: 'Volatility was successfully updated.' }
        format.json { render :show, status: :ok, location: @volatility }
      else
        format.html { render :edit }
        format.json { render json: @volatility.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /volatilities/1
  # DELETE /volatilities/1.json
  def destroy
    @volatility.destroy
    respond_to do |format|
      format.html { redirect_to volatilities_url, notice: 'Volatility was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_volatility
      @volatility = Volatility.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def volatility_params
      params.require(:volatility).permit(:symbol, :vol, :date)
    end
end
