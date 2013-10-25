require 'test_helper'

class LocaleControllerTest < ActionController::TestCase
  test "should get set" do
    get :set
    assert_response :success
  end

end
