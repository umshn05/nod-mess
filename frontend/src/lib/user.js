// Bu demo'da gerçek bir kimlik doğrulama sistemi yok; tarayıcıya özel,
// kalıcı bir demo kullanıcı id'si üretip localStorage'da saklıyoruz.

const STORAGE_KEY = "nodmess_user_id";

export function getUserId() {
  let userId = localStorage.getItem(STORAGE_KEY);
  if (!userId) {
    userId = `demo-${crypto.randomUUID()}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }
  return userId;
}
