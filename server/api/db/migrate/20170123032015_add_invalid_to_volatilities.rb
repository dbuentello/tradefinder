class AddInvalidToVolatilities < ActiveRecord::Migration[5.0]
  def change
    add_column :volatilities, :invalid, :boolean
  end
end
