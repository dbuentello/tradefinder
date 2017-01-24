class RemoveInvalidFromVolatilities < ActiveRecord::Migration[5.0]
  def change
    remove_column :volatilities, :invalid, :boolean
  end
end
