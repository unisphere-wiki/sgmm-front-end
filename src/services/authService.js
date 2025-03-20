import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';

class AuthService {
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      return {
        user: userCredential.user,
        token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      return {
        user: userCredential.user,
        token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      return {
        user: userCredential.user,
        token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  handleError(error) {
    let message = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account already exists with this email';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign in popup was closed before completion';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

// Create an instance and export it
const authService = new AuthService();
export default authService; 