import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminUsersService } from '../../services/openapi-client/api/adminUsers.service';
import { UserDto } from '../../services/openapi-client/model/userDto';
import { UpdateUserStatusDto } from '../../services/openapi-client/model/updateUserStatusDto';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  constructor(private adminUsersService: AdminUsersService) {}

  /**
   * Get all users with pagination and search
   */
  getUsers(pageNumber: number = 1, pageSize: number = 20, search?: string): Observable<{
    users: UserDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.adminUsersService.apiAdminUsersGet(pageNumber, pageSize, search).pipe(
      map(response => {
        const data = response.data;
        return {
          users: data || [],
          total: data?.length || 0,
          page: pageNumber,
          pageSize: pageSize
        };
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<UserDto | undefined> {
    return this.adminUsersService.apiAdminUsersIdGet(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update user status (ban/activate)
   */
  updateUserStatus(id: number, statusDto: UpdateUserStatusDto): Observable<UserDto | undefined> {
    return this.adminUsersService.apiAdminUsersIdStatusPut(id, statusDto).pipe(
      map(response => response.data)
    );
  }
}
