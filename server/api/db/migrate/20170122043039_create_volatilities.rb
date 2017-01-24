class CreateVolatilities < ActiveRecord::Migration[5.0]
  def change
    create_table :volatilities do |t|
      t.string :symbol
      t.decimal :vol
      t.datetime :date

      t.timestamps
    end
  end
end
