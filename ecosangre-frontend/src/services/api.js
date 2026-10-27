import axios from 'axios';

// Apuntamos directo al puerto nativo que nos dio tu consola limpia
const API_URL = 'http://localhost:5195/api/bloodrequests';

export const bloodRequestService = {
  getActiveRequests: function(bloodType, city) {
    return axios.get(API_URL + '/active', {
      params: { bloodType: bloodType || '', city: city || '' }
    }).then(function(res) { return res.data; });
  },

  createRequest: function(requestData) {
    return axios.post(API_URL, requestData).then(function(res) { return res.data; });
  },

  joinAsDonor: function(id) {
    return axios.put(API_URL + '/' + id + '/join').then(function(res) { return res.data; });
  },

  closeRequest: function(id) {
    return axios.delete(API_URL + '/' + id);
  }
};
