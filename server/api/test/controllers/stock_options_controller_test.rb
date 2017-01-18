require 'test_helper'

class StockOptionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @stock_option = stock_options(:one)
  end

  test "should get index" do
    get stock_options_url
    assert_response :success
  end

  test "should get new" do
    get new_stock_option_url
    assert_response :success
  end

  test "should create stock_option" do
    assert_difference('StockOption.count') do
      post stock_options_url, params: { stock_option: {  } }
    end

    assert_redirected_to stock_option_url(StockOption.last)
  end

  test "should show stock_option" do
    get stock_option_url(@stock_option)
    assert_response :success
  end

  test "should get edit" do
    get edit_stock_option_url(@stock_option)
    assert_response :success
  end

  test "should update stock_option" do
    patch stock_option_url(@stock_option), params: { stock_option: {  } }
    assert_redirected_to stock_option_url(@stock_option)
  end

  test "should destroy stock_option" do
    assert_difference('StockOption.count', -1) do
      delete stock_option_url(@stock_option)
    end

    assert_redirected_to stock_options_url
  end
end
