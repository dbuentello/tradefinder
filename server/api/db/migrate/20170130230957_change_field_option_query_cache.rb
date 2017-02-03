class ChangeFieldOptionQueryCache < ActiveRecord::Migration[5.0]
  def change
    remove_column :option_query_caches, :expirations
    add_column :option_query_caches, :expirations, :string
  end
end
