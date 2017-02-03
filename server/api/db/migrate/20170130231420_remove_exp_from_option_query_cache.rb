class RemoveExpFromOptionQueryCache < ActiveRecord::Migration[5.0]
  def change
    remove_column :option_query_caches, :expirations
  end
end
