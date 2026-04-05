import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Employee, Notification, NotificationPreferences } from '../types';

export const notificationService = {
  async generateProactiveAlerts(employees: Employee[]) {
    if (!auth.currentUser) return;

    const prefDoc = await getDoc(doc(db, 'userPreferences', auth.currentUser.uid));
    const preferences: NotificationPreferences = prefDoc.exists() 
      ? prefDoc.data().notifications 
      : { performanceAlerts: true, complianceAlerts: true, burnoutAlerts: true, emailNotifications: false };

    const existingNotifications = await getDocs(collection(db, 'notifications'));
    const existingTitles = new Set(existingNotifications.docs.map(d => d.data().title));

    const newAlerts: Partial<Notification>[] = [];

    // 1. Burnout Risk Alerts
    if (preferences.burnoutAlerts) {
      employees.forEach(emp => {
        if (emp.burnoutRisk > 75 && !existingTitles.has(`High Burnout Risk: ${emp.name}`)) {
          newAlerts.push({
            title: `High Burnout Risk: ${emp.name}`,
            message: `${emp.name} has a burnout risk of ${emp.burnoutRisk}%. NEXA-HR suggests an immediate wellness check-in.`,
            type: 'Burnout',
            priority: 'High',
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      });
    }

    // 2. Performance Review Alerts
    if (preferences.performanceAlerts) {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      employees.forEach(emp => {
        if (emp.nextReviewDate) {
          const reviewDate = new Date(emp.nextReviewDate);
          if (reviewDate <= thirtyDaysFromNow && reviewDate >= today && !existingTitles.has(`Upcoming Performance Review: ${emp.name}`)) {
            newAlerts.push({
              title: `Upcoming Performance Review: ${emp.name}`,
              message: `${emp.name}'s performance review is scheduled for ${reviewDate.toLocaleDateString()}. Prepare feedback documents.`,
              type: 'Performance',
              priority: 'Medium',
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        }
      });
    }

    // 3. Compliance Alerts (Visa Expiry)
    if (preferences.complianceAlerts) {
      const today = new Date();
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(today.getDate() + 60);

      employees.forEach(emp => {
        if (emp.visaExpiry) {
          const expiryDate = new Date(emp.visaExpiry);
          if (expiryDate <= sixtyDaysFromNow && expiryDate >= today && !existingTitles.has(`Visa Expiry Alert: ${emp.name}`)) {
            newAlerts.push({
              title: `Visa Expiry Alert: ${emp.name}`,
              message: `${emp.name}'s visa expires on ${expiryDate.toLocaleDateString()}. Initiate renewal process to avoid compliance penalties.`,
              type: 'Compliance',
              priority: 'High',
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        }
      });
    }

    // 4. System Onboarding (if no data)
    if (employees.length === 0 && !existingTitles.has('Welcome to NEXA-HR')) {
      newAlerts.push({
        title: 'Welcome to NEXA-HR',
        message: 'Your workspace is ready. Start by uploading CVs in the Recruitment module or adding employees in the Workforce module.',
        type: 'System',
        priority: 'Low',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Save new alerts to Firestore
    for (const alert of newAlerts) {
      await addDoc(collection(db, 'notifications'), alert);
    }
  }
};
