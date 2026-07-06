import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { GuestId } from '../common/decorators/guest-id.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(@Query('q') query: string, @GuestId() guestId: string) {
    return this.searchService.globalSearch(query, guestId);
  }
}
