'use client'

import { Settings, Users, Shield, Database, BarChart3 } from 'lucide-react'

export default function AdminControls() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Controls</h1>
          <p className="text-lg text-gray-600">Manage users, settings, and system configuration</p>
        </div>

        {/* Under Construction Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Under Construction
              </h3>
              <p className="text-yellow-700 mt-1">
                Admin controls are currently being developed. Check back soon for user management, 
                system settings, and advanced configuration options.
              </p>
            </div>
          </div>
        </div>

        {/* Planned Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions. Add new users and assign admin or lead roles.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon...
            </div>
          </div>

          {/* Database Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Database Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor database performance, manage data imports, and configure database settings.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon...
            </div>
          </div>

          {/* Analytics Configuration */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Analytics Configuration</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure analytics dashboards, set up automated reports, and customize data views.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon...
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure application settings, manage integrations, and customize the user experience.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon...
            </div>
          </div>

          {/* Security & Compliance */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Security & Compliance</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage security policies, audit logs, and compliance settings for data protection.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon...
            </div>
          </div>

          {/* API Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-indigo-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">API Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure API endpoints, manage rate limits, and monitor API usage and performance.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon...
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need admin assistance? Contact your system administrator for help with user management and system configuration.
          </p>
        </div>
      </div>
    </div>
  )
}