import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, BarChart3, Clock, Shield, Search, ArrowLeft, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserData {
  id: number;
  username: string;
  is_admin: number;
  created_at: string;
  last_login: string | null;
  generation_count: number;
}

interface Stats {
  totalUsers: number;
  totalGenerations: number;
  todayGenerations: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ]);

      if (usersRes.status === 403 || statsRes.status === 403) {
        setError('您没有管理员权限');
        setIsLoading(false);
        return;
      }

      if (!usersRes.ok || !statsRes.ok) {
        throw new Error('获取数据失败');
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData.users);
      setStats(statsData.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSetupAdmin = async () => {
    setIsSettingUp(true);
    try {
      const res = await fetch('/api/admin/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('设置成功！您现在是管理员了。');
        window.location.reload();
      } else {
        alert(data.error || '设置失败');
      }
    } catch (err) {
      alert('请求失败');
    } finally {
      setIsSettingUp(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">访问受限</h1>
          <p className="text-slate-500">{error}</p>
          
          {error.includes('没有管理员权限') && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-400 mb-4">如果是首次部署，您可以尝试初始化管理员：</p>
              <button
                onClick={handleSetupAdmin}
                disabled={isSettingUp}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                设为管理员
              </button>
            </div>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              管理后台
            </h1>
            <p className="text-slate-500 mt-1">监控用户注册及系统运行状态</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">总注册用户</div>
              <div className="text-2xl font-bold text-slate-900">{stats?.totalUsers}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">累计生成次数</div>
              <div className="text-2xl font-bold text-slate-900">{stats?.totalGenerations}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">今日生成</div>
              <div className="text-2xl font-bold text-slate-900">{stats?.todayGenerations}</div>
            </div>
          </motion.div>
        </div>

        {/* User Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">用户列表</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索用户名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none w-full md:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">用户</th>
                  <th className="px-6 py-4">权限</th>
                  <th className="px-6 py-4">注册时间</th>
                  <th className="px-6 py-4">最后活跃</th>
                  <th className="px-6 py-4 text-right">生成次数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_admin ? (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase">管理员</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">普通用户</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(u.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString('zh-CN') : '从未登录'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-slate-900">{u.generation_count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              未找到匹配的用户
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
