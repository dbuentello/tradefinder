Rails.application.routes.draw do
  resources :volatilities
  resources :stock_options
  get 'tradefinder_app/index'

  resources :stocks
  # get 'welcome/index'

  root 'tradefinder_app#index'

  get 'ivr', to: 'ivr#ivr'

  match '*any' => 'application#options', :via => [:options]

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
