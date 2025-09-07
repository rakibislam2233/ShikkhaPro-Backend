import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserService } from './user.service';
import pick from '../../shared/pick';
import { USER_UPLOAD_FOLDER } from './user.constant';

const getAllUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['role', 'status', 'searchTerm']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const users = await UserService.getAllUsers(filters, options);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Users retrieved successfully.',
    data: users,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await UserService.getUserById(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User retrieved successfully.',
    data: user,
  });
});
const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await UserService.updateUserStatus(id, status);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User status updated successfully.',
    data: user,
  });
});

const getDashboardOverview = catchAsync(async (req, res) => {
  const data = await UserService.getDashboardOverview();
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Dashboard overview retrieved successfully.',
    data,
  });
});
const userActivityGraphChart = catchAsync(async (req, res) => {
  const { period } = req.query as { period: 'weekly' | 'monthly' | 'yearly' };
  const data = await UserService.userActivityGraphChart(period);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User activity data retrieved successfully.',
    data,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const user = await UserService.getMyProfile(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Profile retrieved successfully.',
    data: user,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const { userId } = req.user;
  // Handle file upload
  if (req.file) {
    console.log("REQUEST FILE", req.file);
    req.body.avatar = `/${USER_UPLOAD_FOLDER}/${req.file.path}`;
  }
  const updateData = req?.body;
  const user = await UserService.updateMyProfile(userId, updateData);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Profile updated successfully.',
    data: user,
  });
});
const deleteMyProfile = catchAsync(async (req, res) => {
  const { userId } = req.user;
  await UserService.deleteMyProfile(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Profile deleted successfully.',
    data: {},
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getMyProfile,
  userActivityGraphChart,
  updateMyProfile,
  deleteMyProfile,
  getDashboardOverview,
};
