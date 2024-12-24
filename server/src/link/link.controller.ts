import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('link')
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() { orgLink }: { orgLink: string }, @Request() req) {
    return this.linkService.createLink({ orgLink, userId: req.user._id });
  }

  @Post('/public') async createPublicLink(
    @Body() { orgLink }: { orgLink: string },
  ) {
    return this.linkService.createPublicLink({ orgLink });
  }

  @Patch('/public') // Ensure the route is correctly configured for public access
  async clickPublicLink(@Body() { id }: { id: string }) {
    const orgLink = await this.linkService.clickLink(id);
    if (orgLink) {
      return orgLink;
    } else {
      throw new NotFoundException('Link Not found');
    }
  }

  @Patch()
  @UseGuards(AuthGuard)
  async getLink(@Body() { id }: { id: string }) {
    const orgLink = await this.linkService.clickLink(id);
    if (orgLink) {
      return orgLink;
    } else {
      throw new NotFoundException('Link Not found');
    }
  }

  @Get('/')
  @UseGuards(AuthGuard)
  async getLinks(@Request() req) {
    const userId = req.user._id;
    return this.linkService.getUserLinks(userId);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async deleteLink(@Param('id') id: string) {
    this.linkService.deleteLink(id);
  }
}
