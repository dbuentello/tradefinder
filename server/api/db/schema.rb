# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170123033038) do

  create_table "stock_options", force: :cascade do |t|
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

  create_table "stocks", force: :cascade do |t|
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

  create_table "volatilities", force: :cascade do |t|
    t.string   "symbol"
    t.decimal  "vol"
    t.datetime "date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
