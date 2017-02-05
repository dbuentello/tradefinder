class CreateVolQueryCaches < ActiveRecord::Migration[5.0]
  def change
    create_table :vol_query_caches do |t|
      t.string :symbol
      t.index ["symbol"], name: "index_vol_query_caches_on_symbol"
      t.timestamps
    end
  end
end
