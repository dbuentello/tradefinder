import { TradefinderAppPage } from './app.po';

describe('tradefinder-app App', function() {
  let page: TradefinderAppPage;

  beforeEach(() => {
    page = new TradefinderAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
