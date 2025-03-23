"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { getAllUsers, getUserById, updateUser, deleteUser, createUser } from "@/lib/api";
import { User, RegisterRequest, UpdateProfileRequest } from "@/lib/types";
import Modal from "react-modal";

// Configurar el modal para accesibilidad
Modal.setAppElement("#__next");

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<RegisterRequest | UpdateProfileRequest>({
    email: "",
    username: "",
    password: "", // Solo para creación
    ciudad: "",
    website: "",
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (user?.rol !== "admin") {
      setError("No tienes permisos para acceder a esta página");
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    const response = await getAllUsers();
    if (response.error) {
      setError(response.error);
    } else {
      setUsers(response.data || []);
    }
    setLoading(false);
  };

  // Abrir modal para crear usuario
  const handleCreateUser = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({ email: "", username: "", password: "", ciudad: "", website: "" });
    setIsModalOpen(true);
  };

  // Abrir modal para actualizar usuario
  const handleUpdateUser = async (userId: number) => {
    const response = await getUserById(userId);
    if (response.data) {
      setSelectedUser(response.data);
      setModalMode("update");
      setFormData({
        email: response.data.email,
        username: response.data.username,
        ciudad: response.data.ciudad || "",
        website: response.data.website || "",
      });
      setIsModalOpen(true);
    } else {
      setError("Error al obtener la información del usuario");
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      const response = await deleteUser(userId);
      if (response.error) {
        setError(response.error);
      } else {
        fetchUsers();
      }
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async () => {
    if (modalMode === "create") {
      const response = await createUser(formData as RegisterRequest);
      if (response.error) {
        setError(response.error);
      } else {
        setIsModalOpen(false);
        fetchUsers();
      }
    } else if (selectedUser) {
      const response = await updateUser(selectedUser.id, formData as UpdateProfileRequest);
      if (response.error) {
        setError(response.error);
      } else {
        setIsModalOpen(false);
        fetchUsers();
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <button
        onClick={handleCreateUser}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Crear Nuevo Usuario
      </button>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Rol</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-100">
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.rol}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleUpdateUser(u.id)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para crear o actualizar usuario */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">
          {modalMode === "create" ? "Crear Usuario" : "Actualizar Usuario"}
        </h2>
        <form>
          <div className="mb-4">
            <label className="block mb-1">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              required={modalMode === "create"}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              required={modalMode === "create"}
            />
          </div>
          {modalMode === "create" && (
            <div className="mb-4">
              <label className="block mb-1">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-1">Ciudad:</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Website:</label>
            <input
              type="text"
              name="website"
              value={formData.website || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveUser}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;