import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { FaRegSave } from "react-icons/fa";
import Loading from "../components/Extensions/Loading";
import { useTranslation } from "react-i18next";
import {
  formatPhoneNumber,
  formatTime,
  getClientResolutionClass,
} from "../services/Utilities";
import { useUser } from "../contexts/UserContext";

function Profile() {
  const currentUser = useUser();
  const { username } = useParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    adress: "",
    genre: [],
    position: [],
    recruitmentDate: "",
    birthday: "",
    phone: "",
  });
  const [employeeForm, setEmployeeForm] = useState({
    gender: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
    ],
    position: [],
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        first_name: employee.user?.first_name || "",
        last_name: employee.user?.last_name || "",
        email: employee.user?.email || "",
        username: employee.user?.username || "",
        adress: employee.adress || "",
        genre: employee.genre || [],
        position: employee.position || [],
        recruitmentDate: employee.recruitmentDate || "",
        birthday: employee.birthday || "",
        phone: employee.phone || "",
      });
    }
  }, [isEditing]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/api/profile/${username}/`);
        const data = response.data;
        setEmployee(data);
      } catch (err) {
        alert(err);
      }

      try {
        await api
          .get("api/myprofile/getpositions/")
          .then((resp) => {
            setEmployeeForm({ ...employeeForm, position: resp.data });
          })
          .catch((err) => alert(err))
          .finally(() => setLoading(false));
      } catch (err) {
        alert(err);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    // setLoading(true);
    // try {
    //   await api.put(`/api/updateuserinfos/${employee.user?.id}/`, {
    //     ...formData,
    //     last_name: formData.last_name.toUpperCase(),
    //   });
    //   setIsEditing(false);
    //   location.reload();
    // } catch (err) {
    //   alert(err);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="w-full lg:w-[75%] mx-auto p-8 bg-white rounded-3xl shadow-lg">
      {loading && <Loading />}
      {/* Profile Picture */}
      <div className="mb-1">
        <img
          src={employee.cover_pic}
          alt="CoverPicture"
          className="w-full aspect-8/2 object-cover rounded-2xl"
        />
        <div className="relative">
          <img
            src={employee.profile_pic}
            alt="Profile"
            className={`rounded-full object-cover absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4" ${
              getClientResolutionClass() == "phone"
                ? "size-32"
                : getClientResolutionClass() == "desktop720"
                ? "size-48"
                : getClientResolutionClass() == "desktop786"
                ? "size-56"
                : "size-72"
            }`}
          />
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between mt-20 mb-5">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {employee.user?.first_name} {employee.user?.last_name}
          </h1>
          <p className="text-xl text-gray-600">{employee.user?.email}</p>
        </div>
        {currentUser?.id === employee.user?.id && (
          <div className="flex gap-4 justify-center items-center">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaRegSave className="text-xl" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="flex flex-wrap lg:flex-nowrap gap-1 mb-4">
        {employee.isOnline ? (
          <div className="min-w-1/4 p-6 bg-gray-50 rounded-xl border-2 border-green-500 animate-pulse transition-opacity duration-1000 ease-in-out">
            <p className="text-sm text-gray-500 mb-2">Online</p>
            <p className="text-lg font-semibold">Now</p>
          </div>
        ) : (
          <div className="min-w-1/4 p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">Last seen</p>
            <p className="text-lg font-semibold">
              {formatTime(employee.last_seen)}
            </p>
          </div>
        )}
        <div className="min-w-1/4 p-6 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500 mb-2">Posts</p>
          <p className="text-lg font-semibold">4 Mar, 2025</p>
        </div>
        <div className="min-w-1/4 p-6 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500 mb-2">Reactions</p>
          <p className="text-lg font-semibold">$118.00</p>
        </div>
        <div className="min-w-1/4 p-6 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500 mb-2">Comments</p>
          <p className="text-lg font-semibold">$0.00</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 gap-12">
        <div className="flex flex-col gap-6 px-2">
          {/* Name Section */}
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("forms.firstname")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg px-4 text-gray-900 space-y-2">
                  <p>{employee.user?.first_name}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("forms.lastname")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg px-4 text-gray-900 space-y-2">
                  <p>{employee.user?.last_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Email Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="text-lg px-4 text-gray-900">
                <p>{employee.user?.email}</p>
              </div>
            )}
          </div>

          {/* Position and gender Section */}
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              {isEditing ? (
                <select
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="position"
                >
                  {employeeForm.position.map((pos) => (
                    <option
                      key={pos.value}
                      value={pos.value}
                      defaultValue={formData.position}
                    >
                      {pos.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-lg px-4 text-gray-900">
                  {employee.position}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              {isEditing ? (
                <select
                  name="genre"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {employeeForm.gender.map((gen) => (
                    <option key={gen.value} value={gen.value}>
                      {gen.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-lg px-4 text-gray-900">{employee.gender}</p>
              )}
            </div>
          </div>

          {/* Recrutement and Birthday Date Section */}
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recrutement Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="recruitmentDate"
                  value={formData.recruitmentDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg px-4 text-gray-900">
                  <p>{employee.recruitmentDate}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birthday Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg px-4 text-gray-900">
                  <p>{employee.birthday}</p>
                </div>
              )}
            </div>
          </div>

          {/* Adress and Phone Section */}
          <div className="flex  flex-wrap justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("forms.adress")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="adress"
                  value={formData.adress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg px-4 text-gray-900 space-y-2">
                  <p>{employee.adress}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("forms.phone")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg px-4 text-gray-900 space-y-2">
                  <p>{formatPhoneNumber(employee.phone)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Username Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            {isEditing ? (
              <div className="flex">
                <span className="px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500">
                  hdjapp.dz/profile/
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              <p className="text-lg px-4 text-gray-900">
                hdjapp.dz/profile/{employee.user?.username}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
