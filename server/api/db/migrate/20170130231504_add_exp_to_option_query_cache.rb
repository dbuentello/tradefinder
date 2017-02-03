class AddExpToOptionQueryCache < ActiveRecord::Migration[5.0]
  def change
    add_column :option_query_caches, :expirations, :string
  end
end
