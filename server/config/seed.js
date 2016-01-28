/**
 * 初始化数据
 */

'use strict';

const mongoose = require('mongoose');
const	User = mongoose.model('User');
const	Article = mongoose.model('Article');
const	TagCategory = mongoose.model('TagCategory');
const	Tag = mongoose.model('Tag');

//初始化标签,文章,用户
function initData() {
	return function *(next) {
		if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
			const userCount = yield User.count();
			if(userCount === 0){
				yield User.remove();
				yield User.create({
		 			nickname:'admin',
		 			email:'admin@admin.com',
		 			role:'admin',
		 			password:'admin',
		 			status:1
		 		},{
		 			nickname:'test001',
		 			email:'test001@test.com',
		 			role:'user',
		 			password:'test',
		 			status:1
		 		},{
		 			nickname:'test002',
		 			email:'test002@test.com',
		 			role:'user',
		 			password:'test',
		 			status:2
		 		},{
		 			nickname:'test003',
		 			email:'test003@test.com',
		 			role:'user',
		 			password:'test',
		 			status:0
		 		});
			}
			const tagCount = yield TagCategory.count();
				if(tagCount === 0){
					yield TagCategory.remove();
					yield Tag.remove();
					const languageCat = yield TagCategory.create({
								name:'language',
								desc:'按编程语言分类'
							}).exec();
					yield Tag.create({
									name:'nodejs',
									cid:languageCat._id,
									is_show:true
								},{
									name:'angular',
									cid:languageCat._id,
									is_show:true
								},{
									name:'react',
									cid:languageCat._id,
									is_show:true
								});
					const systemCat = yield TagCategory.create({
																		name:'system',
																		desc:'按操作系统分类'
																	});
					yield Tag.create({
									name:'linux',
									cid:systemCat._id,
									is_show:true
								},{
									name:'ios',
									cid:systemCat._id,
									is_show:true
								},{
									name:'android',
									cid:systemCat._id,
									is_show:true
								});
					const otherCat = yield TagCategory.create({
																	name:'other',
																	desc:'其它分类'
																});
					yield Tag.create({
									name:'git',
									cid:otherCat._id,
									is_show:true
								});

					const tags = yield Tag.find({});
					yield Article.remove();
					yield tags.map(function (tag,index) {
						var indexOne = parseInt(index) +1;
						var indexTwo = parseInt(index) +2;
						Article.create({
							title:'第' + (index + indexOne) + '篇文章',
							content:'<p>我第' + (index + indexOne) + '次爱你.</p>',
							tags:[tag._id],
							status:1
						},{
							title:'第' + (index + indexTwo) + '篇文章',
							content:'<p>我第' + (index + indexTwo) + '次爱你.</p>',
							tags:[tag._id],
							status:1
						});
					});
				}
			}
			yield next;
		}
	}
	module.exports = initData
