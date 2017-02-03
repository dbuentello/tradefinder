class AddIndexToStockOptions < ActiveRecord::Migration[5.0]
  def change
    add_index(:stock_options, :symbol)
    add_index(:stock_options, :date)
  end
end
