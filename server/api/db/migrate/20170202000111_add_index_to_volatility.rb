class AddIndexToVolatility < ActiveRecord::Migration[5.0]
  def change
    add_index(:volatilities, :symbol)
    add_index(:volatilities, :date)
  end
end
