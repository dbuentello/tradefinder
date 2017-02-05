class DeleteVolQueryCache < ActiveRecord::Migration[5.0]
  def change
    drop_table(:vol_query_caches)
  end
end
