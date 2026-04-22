declare global {
  namespace App {
    interface Locals {
      isAdmin: boolean;
    }

    interface PageData {
      isAdmin: boolean;
    }
  }
}

export {};
