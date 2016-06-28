import $ from 'jquery';
import Promise from './promise';

export default (apiroot) => ({
  apiroot,
  request(path, params = {}, method = 'GET') {
    const url = `${this.apiroot}/${path.replace(/^\//, '')}`;
    return $.ajax(url, {
      method,
      data: params,
    });
  },
  itemsInFolder(id, opts) {
    return this.request(
      '/item',
      $.extend({ folderId: id }, opts)
    );
  },
  filesInItem(id, opts) {
    return this.request(
      `/item/${id}/files`,
      opts
    );
  },
  listFiles(id, opts) {
    return this.itemsInFolder(id, opts)
      .then((items) => {
        const requests = items.map((item) => (
          this.filesInItem(item._id, { limit: 1 })
        ));
        return Promise.all(requests);
      }).then((files) => {
        const ids = [];
        files.forEach((file) => {
          if (file.length) {
            ids.push.apply(ids, file);
          }
        });
        return ids;
      });
  },
  getFile(id, opts) {
    return this.request(
      `/file/${id}/download`,
      opts
    );
  },
});
