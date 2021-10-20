const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id });
          return userData;
        }
        throw new AuthenticationError('Cannot find a user with this id!');
      },
    },
  
    Mutation: {
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        
        if (!user) {
            throw new AuthenticationError('Something is wrong!')
        } 
        const token = signToken(user);
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Wrong password');
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
      saveBook: async (parent, { input }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
          );
  
        
  
          return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in!');
      },
     
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
  
        
  
          return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in!');
      },
    
    },
  };
  
  module.exports = resolvers;
  