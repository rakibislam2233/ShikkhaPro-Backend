import { UserService } from '../models/user/user.service';
import { User } from '../models/user/user.model';
import { IUser, UserStatus } from '../models/user/user.interface';
import mongoose from 'mongoose';

describe('UserService', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = await UserService.getAllUsers({}, {});
      expect(users).toBeDefined();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const user = await UserService.getUserById(mockUserId);
      expect(user).toBeDefined();
    });
  });

  describe('updateUserStatus', () => {
    it('should update a user status', async () => {
      const user = await UserService.updateUserStatus(mockUserId, UserStatus.Active);
      expect(user).toBeDefined();
    });
  });

  describe('getMyProfile', () => {
    it('should return my profile', async () => {
      const user = await UserService.getMyProfile(mockUserId);
      expect(user).toBeDefined();
    });
  });

  describe('updateMyProfile', () => {
    it('should update my profile', async () => {
      const user = await UserService.updateMyProfile(mockUserId, {});
      expect(user).toBeDefined();
    });
  });

  describe('deleteMyProfile', () => {
    it('should delete my profile', async () => {
      const user = await UserService.deleteMyProfile(mockUserId);
      expect(user).toBeDefined();
    });
  });
});
