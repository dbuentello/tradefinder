class CreateVolQueryCache < ActiveRecord::Migration[5.0]
  def change
    create_table :vol_query_caches do |t|
      t.string   "symbol"
      t.datetime "created_at",  null: false
      t.datetime "updated_at",  null: false
      t.index ["symbol"], name: "index_vol_query_caches_on_symbol"
    end
  end
end
