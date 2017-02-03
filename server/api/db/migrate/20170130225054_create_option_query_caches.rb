class CreateOptionQueryCaches < ActiveRecord::Migration[5.0]
  def change
    create_table :option_query_caches do |t|
      t.string :symbol
      t.string :expirations

      t.timestamps
    end
  end
end
