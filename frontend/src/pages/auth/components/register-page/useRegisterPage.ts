import { ref } from "vue";
import { register } from "@/services/auth/auth.service.ts";
import { handleError } from "@/utils/handleError.ts";
import { message } from "@/utils/discrete.ts";
import type { AxiosError } from "axios";
import type { IBaseException } from "@/types/exception.ts";

const useRegisterPage = () => {
  const router = useRouter();

  const name = ref("");
  const email = ref("");
  const password = ref("");
  const loading = ref(false);

  const passwordValid = computed(() => {
    const p = password.value;
    return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[!@#$%^&*(),.?":{}|<>]/.test(p);
  });

  const handleRegister = async () => {
    if (!name.value || !email.value || !passwordValid.value) return;
    loading.value = true;
    try {
      await register({ name: name.value, email: email.value, password: password.value });
      message?.success("Registration successful! Please sign in.");
      await router.push({ name: "Login" });
    } catch (error) {
      handleError(error as AxiosError<IBaseException>);
    } finally {
      loading.value = false;
    }
  };

  return {
    name,
    email,
    password,
    loading,
    passwordValid,
    handleRegister,
  };
};

export default useRegisterPage;
