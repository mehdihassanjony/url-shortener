import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Link, LinkDocument } from './link.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLinkDto } from './dto/create-link.dto';
import { UsersService } from 'src/users/users.service';
import { customAlphabet } from 'nanoid';
import axios from 'axios';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link.name) private linkModel: Model<LinkDocument>,
    private userService: UsersService,
  ) {}
  private nanoId = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    6,
  );
  async createLink({ orgLink, userId }: CreateLinkDto): Promise<LinkDocument> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      } // Validate the URL
      await this.validateUrl(orgLink);
      const shortLink = await this.createShortLink();
      return await this.linkModel.create({ orgLink, userId, shortLink });
    } catch (error) {
      throw new BadRequestException(`Failed to create link: ${error.message}`);
    }
  }
  async createPublicLink({
    orgLink,
  }: {
    orgLink: string;
  }): Promise<LinkDocument> {
    try {
      // Validate the URL
      await this.validateUrl(orgLink);
      const shortLink = await this.createShortLink();
      return await this.linkModel.create({ orgLink, shortLink });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create public link: ${error.message}`,
      );
    }
  }
  async clickLink(id: string): Promise<string> {
    try {
      const link = await this.linkModel.findByIdAndUpdate(id, {
        $inc: { click: 1 },
      });
      if (link) {
        return link.orgLink;
      } else {
        throw new NotFoundException('Link not found');
      }
    } catch (error) {
      throw new BadRequestException(`Failed to get link: ${error.message}`);
    }
  }
  async getUserLinks(userId: string): Promise<LinkDocument[]> {
    try {
      return await this.linkModel.find({ userId });
    } catch (error) {
      throw new BadRequestException(
        `Failed to get user links: ${error.message}`,
      );
    }
  }
  async deleteLink(id: string) {
    try {
      await this.linkModel.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestException(`Failed to delete link: ${error.message}`);
    }
  }
  private async createShortLink(): Promise<string> {
    let shortLink: string;
    let isUnique = false;
    while (!isUnique) {
      const nanoId = this.nanoId();
      shortLink = `${process.env.CLIENT_URL}/${nanoId}`;
      const existingLink = await this.linkModel.findOne({ shortLink });
      if (!existingLink) {
        isUnique = true;
      }
    }
    return shortLink;
  }
  private async validateUrl(url: string): Promise<void> {
    // Check if the URL format is valid using a regular expression
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (!urlRegex.test(url)) {
      throw new BadRequestException('Invalid URL format');
    } // Make an HTTP request to check if the URL is reachable
    try {
      await axios.get(url);
    } catch (error) {
      throw new BadRequestException('URL is not reachable: ', error.message);
    }
  }
}
