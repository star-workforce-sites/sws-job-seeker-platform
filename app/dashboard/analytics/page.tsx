'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Briefcase, CheckCircle } from 'lucide-react'

export default function AnalyticsDashboard() {
  // Data for line chart - Applications over time
  const applicationData = [
    { date: 'Nov 1', applications: 5, interviews: 1 },
    { date: 'Nov 5', applications: 12, interviews: 2 },
    { date: 'Nov 10', applications: 18, interviews: 3 },
    { date: 'Nov 15', applications: 24, interviews: 5 },
    { date: 'Nov 20', applications: 32, interviews: 7 },
  ]

  // Data for bar chart - Response rates
  const responseData = [
    { company: 'TechCorp', responses: 5, noResponse: 8 },
    { company: 'StartupXYZ', responses: 3, noResponse: 12 },
    { company: 'DataSolutions', responses: 7, noResponse: 5 },
    { company: 'CloudInc', responses: 4, noResponse: 10 },
    { company: 'InnovateLabs', responses: 6, noResponse: 7 },
  ]

  // Data for pie chart - Application status
  const statusData = [
    { name: 'Applied', value: 32, color: '#0A1A2F' },
    { name: 'Interview', value: 7, color: '#E8C547' },
    { name: 'Accepted', value: 2, color: '#10B981' },
    { name: 'Rejected', value: 8, color: '#EF4444' },
  ]

  const COLORS = ['#0A1A2F', '#E8C547', '#10B981', '#EF4444']

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your job search performance and response rates</p>
        </div>
      </div>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">32</p>
                <p className="text-xs text-green-600 mt-1">+5 this week</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recruiter Responses</p>
                <p className="text-2xl font-bold text-foreground">25</p>
                <p className="text-xs text-muted-foreground mt-1">78% response rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interview Scheduled</p>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-xs text-green-600 mt-1">+2 this week</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offers Received</p>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground mt-1">6% offer rate</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Charts */}
      <section className="px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Line Chart */}
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Application Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    color: 'var(--foreground)',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="var(--primary)" strokeWidth={2} name="Applications" />
                <Line type="monotone" dataKey="interviews" stroke="var(--accent)" strokeWidth={2} name="Interviews" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar Chart and Pie Chart */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Response Rates by Company</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="company" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="responses" fill="var(--primary)" name="Responses" />
                  <Bar dataKey="noResponse" fill="var(--muted)" name="No Response" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart */}
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Application Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      color: 'var(--foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Stats Table */}
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Detailed Metrics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Average Response Time</p>
                <p className="text-2xl font-bold text-foreground">2.3 days</p>
                <p className="text-xs text-green-600 mt-1">Faster than average</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Interview to Offer Ratio</p>
                <p className="text-2xl font-bold text-foreground">28.6%</p>
                <p className="text-xs text-muted-foreground mt-1">2 offers from 7 interviews</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Top Recruiter Source</p>
                <p className="text-2xl font-bold text-foreground">TechCorp</p>
                <p className="text-xs text-muted-foreground mt-1">5 positive responses</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
