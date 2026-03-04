import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Crown, Smartphone, CreditCard, User as UserIcon, History, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenHistory: () => void;
}

const PLANS = [
  { id: 'month', name: '月卡会员', price: 19.9, duration: '1个月', originalPrice: 29.9, badge: '' },
  { id: 'quarter', name: '季卡会员', price: 49.9, duration: '3个月', originalPrice: 89.9, badge: '超值推荐' },
  { id: 'year', name: '年卡会员', price: 99.9, duration: '12个月', originalPrice: 299.9, badge: '限时特惠' },
];

export function UserCenterModal({ isOpen, onClose, onLogout, onOpenHistory }: UserCenterModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  const handlePay = () => {
    // Mock payment logic
    alert(`正在发起支付...\n商品：${selectedPlan.name}\n价格：${selectedPlan.price}元\n支付方式：${paymentMethod === 'wechat' ? '微信支付' : '支付宝'}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-full md:max-w-4xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex-1 overflow-y-auto">
              {/* Header / User Info */}
              <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
                      {user?.username?.[0]?.toUpperCase() || <UserIcon />}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {user?.username || '未登录用户'}
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-medium">
                          普通用户
                        </span>
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">开通会员，解锁无限生成次数</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onOpenHistory();
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <History className="w-4 h-4" />
                    生成历史
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Plans */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    选择会员套餐
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedPlan.id === plan.id
                            ? 'border-indigo-600 bg-indigo-50/50'
                            : 'border-slate-100 hover:border-indigo-200 bg-white'
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                            {plan.badge}
                          </div>
                        )}
                        <div className="text-center space-y-2">
                          <div className="text-slate-900 font-bold text-lg">{plan.name}</div>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-sm text-indigo-600 font-bold">¥</span>
                            <span className="text-3xl font-extrabold text-indigo-600">{plan.price}</span>
                          </div>
                          <div className="text-slate-400 text-sm line-through">¥{plan.originalPrice}</div>
                          <div className="text-slate-500 text-sm pt-2 border-t border-slate-100/50 mt-4">
                            有效期 {plan.duration}
                          </div>
                        </div>
                        {selectedPlan.id === plan.id && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    支付方式
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod('wechat')}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'wechat'
                          ? 'border-green-500 bg-green-50/30'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 bg-[#09BB07] rounded-full flex items-center justify-center text-white">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5,13.5A1.5,1.5 0 0,1 7,15A1.5,1.5 0 0,1 5.5,13.5A1.5,1.5 0 0,1 7,12A1.5,1.5 0 0,1 8.5,13.5M17,13.5A1.5,1.5 0 0,1 15.5,15A1.5,1.5 0 0,1 14,13.5A1.5,1.5 0 0,1 15.5,12A1.5,1.5 0 0,1 17,13.5M22,12C22,16.5 18,20.5 13,20.5C12.5,20.5 12,20.5 11.5,20.4L8.5,22L9,18.5C5,17.5 2,15 2,11.5C2,6.5 6.5,2.5 12,2.5C17.5,2.5 22,6.5 22,12Z" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">微信支付</div>
                        <div className="text-xs text-slate-500">推荐使用</div>
                      </div>
                      {paymentMethod === 'wechat' && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => setPaymentMethod('alipay')}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'alipay'
                          ? 'border-blue-500 bg-blue-50/30'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 bg-[#1677FF] rounded-full flex items-center justify-center text-white">
                        <span className="font-bold text-sm">支</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">支付宝</div>
                        <div className="text-xs text-slate-500">安全快捷</div>
                      </div>
                      {paymentMethod === 'alipay' && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <span className="text-slate-500 text-sm">总计：</span>
                <span className="text-2xl font-extrabold text-indigo-600">¥{selectedPlan.price}</span>
                <span className="text-slate-400 text-xs ml-2">已优惠 ¥{(selectedPlan.originalPrice - selectedPlan.price).toFixed(1)}</span>
              </div>
              <button
                onClick={handlePay}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                立即支付
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
