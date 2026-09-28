import { Controller, Delete, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('experts/:userId/approve')
  approveExpert(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.adminService.approveExpert(userId);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  @Delete('posts/:id')
  deletePost(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deletePost(id);
  }

  @Delete('materials/:id')
  deleteMaterial(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteMaterial(id);
  }

  @Get('analytics')
  analytics() {
    return this.adminService.analytics();
  }
}
