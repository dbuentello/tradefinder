class AddIndexToStocks < ActiveRecord::Migration[5.0]
  def change
    add_index(:stocks, :symbol)
    add_index(:stocks, :date)
  end
end
