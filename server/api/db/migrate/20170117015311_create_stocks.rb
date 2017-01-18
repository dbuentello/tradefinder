class CreateStocks < ActiveRecord::Migration[5.0]
  def change
    create_table :stocks do |t|

      t.datetime "created_at",    null: false
      t.datetime "updated_at",    null: false
      t.string   "symbol"
      t.decimal  "last"
      t.decimal  "percentChange"
      t.decimal  "ivr"
      t.decimal  "iv"
      t.string   "description"
      t.decimal  "bid"
      t.decimal  "ask"
      t.decimal  "open"
      t.decimal  "high"
      t.decimal  "low"
      t.decimal  "close"
      t.integer  "volume"
      t.datetime "date"

    end
  end
end
