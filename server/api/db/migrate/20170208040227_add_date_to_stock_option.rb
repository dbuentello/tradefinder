class AddDateToStockOption < ActiveRecord::Migration[5.0]
  def change
    add_column :stock_options, :date, :string
  end
end
