'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Users, FileText, AlertCircle, Download, Filter, Eye, EyeOff } from 'lucide-react'

export default function AdminPanel() {
  const [showDetails, setShowDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('activity')

  const activityLog = [
    {
      id: 1,
      timestamp: '2024-11-19 14:32:45',
      user: 'john_doe@example.com',
      action: 'Resume Submitted',
      details: 'Submitted resume to 50 recruiters',
      status: 'success',
    },
    {
      id: 2,
      timestamp: '2024-11-19 13:15:20',
      user: 'jane_smith@example.com',
      action: 'Application Created',
      details: 'Applied to Senior Engineer at TechCorp',
      status: 'success',
    },
    {
      id: 3,
      timestamp: '2024-11-19 12:05:10',
      user: 'admin@starworkforce.com',
      action: 'System Update',
      details: 'Database backup completed',
      status: 'success',
    },
    {
      id: 4,
      timestamp: '2024-11-19 11:30:05',
      user: 'sarah_williams@example.com',
      action: 'File Upload Error',
      details: 'Failed to upload resume - file too large',
      status: 'error',
    },
    {
      id: 5,
      timestamp: '2024-11-19 10:45:30',
      user: 'michael_brown@example.com',
      action: 'Recruiter Engagement',
      details: 'Recruiter viewed profile',
      status: 'success',
    },
  ]

  const users = [
    { id: 1, name: 'John Doe', email: 'john_doe@example.com', role: 'Job Seeker', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane_smith@example.com', role: 'Recruiter', status: 'Active', joinDate: '2024-02-20' },
    { id: 3, name: 'Sarah Williams', email: 'sarah_williams@example.com', role: 'Job Seeker', status: 'Inactive', joinDate: '2024-03-10' },
  ]

  const uploads = [
    { id: 1, filename: 'report_2024_Q3.pdf', uploadedBy: 'admin@starworkforce.com', date: '2024-11-15', size: '2.4 MB', verified: true },
    { id: 2, filename: 'compliance_audit.docx', uploadedBy: 'legal@starworkforce.com', date: '2024-11-10', size: '1.8 MB', verified: true },
    { id: 3, filename: 'candidate_data_backup.zip', uploadedBy: 'admin@starworkforce.com', date: '2024-11-05', size: '15.2 MB', verified: false },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-muted border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage activity logs, users, and system operations</p>
        </div>
      </div>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold text-foreground">2,847</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">1,245</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Secure Uploads</p>
                <p className="text-2xl font-bold text-foreground">342</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Alerts</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md bg-muted">
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
            </TabsList>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card className="border border-border">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Activity Logs</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Timestamp</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">User</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((log) => (
                        <tr key={log.id} className="border-b border-border hover:bg-muted transition-colors">
                          <td className="px-6 py-4 text-sm text-muted-foreground">{log.timestamp}</td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{log.user}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{log.action}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                              log.status === 'success' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <Card className="border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">User Management</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Join Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{user.role}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
                          <td className="px-6 py-4 text-sm">
                            <Button variant="outline" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Uploads Tab */}
            <TabsContent value="uploads" className="mt-6">
              <Card className="border border-border">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Secure Report Uploads</h2>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Upload New Report
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Filename</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Uploaded By</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Size</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Verified</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map((upload) => (
                        <tr key={upload.id} className="border-b border-border hover:bg-muted transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{upload.filename}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{upload.uploadedBy}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{upload.date}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{upload.size}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                              upload.verified ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {upload.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <Button variant="outline" size="sm">Download</Button>
                            <Button variant="outline" size="sm">Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}
