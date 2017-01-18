class CreateStockOptions < ActiveRecord::Migration[5.0]
  def change
    create_table :stock_options do |t|

      t.string   "symbol"
      t.string   "description"
      t.decimal  "strike"
      t.boolean  "call"
      t.decimal  "mark"
      t.decimal  "last"
      t.decimal  "bid"
      t.decimal  "ask"
      t.decimal  "theoPrice"
      t.integer  "openInterest"
      t.integer  "volume"
      t.decimal  "iv"
      t.decimal  "percentFromMarket"
      t.decimal  "probOTM"
      t.decimal  "delta"
      t.decimal  "gamma"
      t.decimal  "theta"
      t.decimal  "vega"
      t.integer  "daysToExpiration"
      t.datetime "expiration"
      t.datetime "created_at",        null: false
      t.datetime "updated_at",        null: false

    end
  end
end
