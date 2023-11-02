import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {CreatePostDto} from './dto/create-post.dto';
import {UpdatePostDto} from './dto/update-post.dto';
import {Post} from "./entities/post.entity";

@Injectable()
export class PostService {
  constructor(
      @InjectRepository(Post)
      private repository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto) {
    return this.repository.save({...createPostDto});
  }

  async findAll() {
    let posts = await this.repository.find();

    posts.forEach((post: Post) => {
      delete(post?.user.password);
    });

    return posts;
  }

  async findOne(id: number) {
    let post = await this.repository.findOneBy({ id });
    delete(post?.user.password);

    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.repository.save({...updatePostDto, id});
  }

  async remove(id: number) {
    await this.repository.delete(id);
  }
}
