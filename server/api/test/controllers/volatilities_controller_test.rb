require 'test_helper'

class VolatilitiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @volatility = volatilities(:one)
  end

  test "should get index" do
    get volatilities_url
    assert_response :success
  end

  test "should get new" do
    get new_volatility_url
    assert_response :success
  end

  test "should create volatility" do
    assert_difference('Volatility.count') do
      post volatilities_url, params: { volatility: { date: @volatility.date, symbol: @volatility.symbol, vol: @volatility.vol } }
    end

    assert_redirected_to volatility_url(Volatility.last)
  end

  test "should show volatility" do
    get volatility_url(@volatility)
    assert_response :success
  end

  test "should get edit" do
    get edit_volatility_url(@volatility)
    assert_response :success
  end

  test "should update volatility" do
    patch volatility_url(@volatility), params: { volatility: { date: @volatility.date, symbol: @volatility.symbol, vol: @volatility.vol } }
    assert_redirected_to volatility_url(@volatility)
  end

  test "should destroy volatility" do
    assert_difference('Volatility.count', -1) do
      delete volatility_url(@volatility)
    end

    assert_redirected_to volatilities_url
  end
end
