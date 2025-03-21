import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/Bizquery.svg" alt="Bizquery Logo" className="h-8 w-auto" />
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <Menu as="div" className="ml-3 relative">
              <div>
                <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sgmm-500">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                </Menu.Button>
              </div>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          // Handle logout
                          localStorage.removeItem('token');
                          window.location.href = '/login';
                        }}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              type="button"
              className="ml-3 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sgmm-500"
            >
              <span className="sr-only">View notifications</span>
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 