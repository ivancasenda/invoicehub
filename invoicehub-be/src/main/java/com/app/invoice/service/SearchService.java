package com.app.invoice.service;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import com.app.invoice.Invoice;

import org.apache.lucene.search.MatchAllDocsQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Sort;
import org.hibernate.search.exception.EmptyQueryException;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.MustJunction;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.hibernate.search.query.dsl.sort.SortFieldContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * SearchService provide search functionality to invoices from
 * InvoiceRepository.
 */
@Transactional
@Service
public class SearchService {

	private static final int SORT_RELEVANCE = 0;
	private static final int SORT_DESC = 1;
	// private static final int SORT_ASC = 2;

	@PersistenceContext
	private EntityManager entityManager;

	/**
	 * Search saved invoice in the database with multiple parameters.
	 * 
	 * @param resultSize   set maximum number of invoices return.
	 * @param firstRow     set begining index from search result list.
	 * @param globalFilter can be null, keyword to be search on invoice id or store
	 *                     name field.
	 * @param invoiceID    can be null, invoice id to be search.
	 * @param storeName    can be null, optional store name to be search.
	 * @param datetimeFrom can be null, optional, specify date and time return
	 *                     Invoices must be above.
	 * @param datetimeTo   can be null, optional, specify date and time return
	 *                     Invoices must be below.
	 * @param sortField    can be null, optional field to be sorted. valid field =
	 *                     invoiceID, storeName, datetime.
	 * @param sortOrder    order to sorted. 0 = relevance, 1 = descending, 2 =
	 *                     ascending.
	 * @return List of Invoices that match search parameters.
	 * @throws IllegalArgumentException if invalid sortField or sortOrder.
	 */
	public List<Invoice> search(int resultSize, int firstRow, String globalFilter, String invoiceID, String storeName,
			LocalDateTime datetimeFrom, LocalDateTime datetimeTo, String sortField, int sortOrder) {
		if (sortField != null && !sortField.equals(Invoice.INVOICE_ID_FIELD)
				&& !sortField.equals(Invoice.STORE_NAME_FIELD) && !sortField.equals(Invoice.DATETIME_FIELD))
			throw new IllegalArgumentException("Invalid sortField, must be either invoiceID, storeName, or datetime.");
		if (sortOrder != 0 && sortOrder != 1 && sortOrder != 2)
			throw new IllegalArgumentException("Invalid sortOrder, must be either 0, 1, or 2.");

		FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

		QueryBuilder queryBuilder = fullTextEntityManager.getSearchFactory()
				.buildQueryBuilder()
				.forEntity(Invoice.class)
				.get();

		FullTextQuery query = getFullTextQuery(fullTextEntityManager, queryBuilder, globalFilter, invoiceID, storeName,
				datetimeFrom, datetimeTo);

		if (sortOrder != SORT_RELEVANCE) {
			sortField = getSortFieldName(sortField);
			query.setSort(getSort(queryBuilder, sortField, sortOrder));
		}

		setMaxAndFirstResult(query, resultSize, firstRow);

		@SuppressWarnings("unchecked")
		List<Invoice> searchResult = query.getResultList();

		return searchResult;
	}

	/**
	 * Get total invoices found based on search parameters.
	 * 
	 * @param globalFilter optional keyword to be search on invoice id or store name
	 *                     field.
	 * @param invoiceID    optional invoice id to be search.
	 * @param storeName    optional store name to be search.
	 * @param datetimeFrom optional, specify date and time return Invoices must be
	 *                     above.
	 * @param datetimeTo   optional, specify date and time return Invoices must be
	 *                     below.
	 * @return number of invoices found.
	 */
	public int totalSearch(String globalFilter, String invoiceID, String storeName, LocalDateTime datetimeFrom,
			LocalDateTime datetimeTo) {
		FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

		QueryBuilder queryBuilder = fullTextEntityManager.getSearchFactory()
				.buildQueryBuilder()
				.forEntity(Invoice.class)
				.get();

		FullTextQuery query = getFullTextQuery(fullTextEntityManager, queryBuilder, globalFilter, invoiceID, storeName,
				datetimeFrom, datetimeTo);

		return query.getResultSize();
	}

	/**
	 * Create query based on search parameters
	 * 
	 * @param fullTextEntityManager manager to create full text query.
	 * @param queryBuilder          builder to combine multiple query parameters.
	 * @param globalFilter
	 * @param invoiceID
	 * @param storeName
	 * @param datetimeFrom
	 * @param datetimeTo
	 * @return query to be executed.
	 */
	private FullTextQuery getFullTextQuery(FullTextEntityManager fullTextEntityManager, QueryBuilder queryBuilder,
			String globalFilter, String invoiceID, String storeName, LocalDateTime datetimeFrom,
			LocalDateTime datetimeTo) {

		FullTextQuery query;

		if (globalFilter == null && invoiceID == null && storeName == null && datetimeFrom == null
				&& datetimeTo == null) {
			query = getAllQuery(fullTextEntityManager);
		} else {
			MustJunction buildQuery = queryBuilder
					.bool()
					.must(getDatetimeFromQuery(queryBuilder, datetimeFrom))
					.must(getDatetimeToQuery(queryBuilder, datetimeTo));

			if (globalFilter != null) {
				try {
					buildQuery = buildQuery.must(getGlobalFilterQuery(queryBuilder, globalFilter));
				} catch (EmptyQueryException e) {
				}
			}

			if (invoiceID != null) {
				try {
					buildQuery = buildQuery.must(getInvoiceIDQuery(queryBuilder, invoiceID));
				} catch (EmptyQueryException e) {
				}
			}

			if (storeName != null) {
				try {
					buildQuery = buildQuery.must(getStoreNameQuery(queryBuilder, storeName));
				} catch (EmptyQueryException e) {
				}
			}

			Query luceneQuery = buildQuery.createQuery();

			query = fullTextEntityManager.createFullTextQuery(luceneQuery, Invoice.class);
		}
		return query;
	}

	/**
	 * Create query for global search on invoices.
	 * 
	 * @param queryBuilder
	 * @param globalFilter keyword or phrase to be search.
	 * @return global filter query.
	 */
	private Query getGlobalFilterQuery(QueryBuilder queryBuilder, String globalFilter) {
		return queryBuilder
				.bool()
				.should(getInvoiceIDQuery(queryBuilder, globalFilter))
				.should(getStoreNameQuery(queryBuilder, globalFilter))
				.createQuery();
	}

	/**
	 * Create query for invoice id search.
	 * 
	 * @param queryBuilder
	 * @param invoiceID    invoice id to be search.
	 * @return invoice id query.
	 */
	private Query getInvoiceIDQuery(QueryBuilder queryBuilder, String invoiceID) {
		invoiceID = invoiceID.toLowerCase();
		return queryBuilder
				.bool()
				.should(queryBuilder
						.keyword()
						.wildcard()
						.onField(Invoice.INVOICE_ID_FIELD)
						.matching(invoiceID + "*")
						.createQuery())
				.should(queryBuilder
						.keyword()
						.fuzzy()
						.onField(Invoice.INVOICE_ID_FIELD)
						.matching(invoiceID)
						.createQuery())
				.createQuery();
	}

	/**
	 * Create query for store name search.
	 * 
	 * @param queryBuilder
	 * @param storeName    store name to be search.
	 * @return store name query.
	 */
	private Query getStoreNameQuery(QueryBuilder queryBuilder, String storeName) {
		storeName = storeName.toLowerCase();
		return queryBuilder
				.bool()
				.should(queryBuilder
						.keyword()
						.fuzzy()
						.onField(Invoice.STORE_NAME_FIELD)
						.matching(storeName)
						.createQuery())
				.should(queryBuilder
						.keyword()
						.wildcard()
						.onField(Invoice.STORE_NAME_FIELD)
						.matching(storeName + "*")
						.createQuery())
				.createQuery();
	}

	/**
	 * Create query for invoices with date and time above or equals @datetimeFrom
	 * parameters.
	 * 
	 * @param queryBuilder
	 * @param datetimeFrom
	 * @return datetimeFrom query.
	 */
	private Query getDatetimeFromQuery(QueryBuilder queryBuilder, LocalDateTime datetimeFrom) {
		return queryBuilder
				.range()
				.onField(Invoice.DATETIME_FIELD)
				.above(datetimeFrom)
				.createQuery();
	}

	/**
	 * Create query for invoices with date and time below or equals @datetimeTo
	 * parameters.
	 * 
	 * @param queryBuilder
	 * @param datetimeTo
	 * @return datetimeFrom query.
	 */
	private Query getDatetimeToQuery(QueryBuilder queryBuilder, LocalDateTime datetimeTo) {
		return queryBuilder
				.range()
				.onField(Invoice.DATETIME_FIELD)
				.below(datetimeTo)
				.createQuery();
	}

	/**
	 * Create query to get all invoices.
	 * 
	 * @param fullTextEntityManager
	 * @return all invoices query.
	 */
	private FullTextQuery getAllQuery(FullTextEntityManager fullTextEntityManager) {
		return fullTextEntityManager.createFullTextQuery(new MatchAllDocsQuery(), Invoice.class);
	}

	/**
	 * Create sort for invoice search result.
	 * 
	 * @param queryBuilder
	 * @param sortField    invoice field to be sorted.
	 * @param sortOrder    the sort order for sort field.
	 * @return sort based on sortField and sortOrder.
	 */
	private Sort getSort(QueryBuilder queryBuilder, String sortField, int sortOrder) {
		SortFieldContext setSortField = queryBuilder.sort().byField(sortField);

		SortFieldContext setSortOrder;
		if (sortOrder == SORT_DESC)
			setSortOrder = setSortField.desc();
		else
			setSortOrder = setSortField.asc();

		return setSortOrder.createSort();
	}

	/**
	 * Set maximum size and first row from search result list.
	 * 
	 * @param query
	 * @param resultSize
	 * @param firstRow
	 */
	private void setMaxAndFirstResult(FullTextQuery query, int resultSize, int firstRow) {
		query.setMaxResults(resultSize);
		query.setFirstResult(firstRow);
	}

	/**
	 * Get invoice sort field name.
	 * 
	 * @param sortField
	 * @return sort field name.
	 */
	private String getSortFieldName(String sortField) {
		switch (sortField) {
			case Invoice.INVOICE_ID_FIELD:
				return Invoice.INVOICE_ID_SORT;
			case Invoice.STORE_NAME_FIELD:
				return Invoice.STORE_NAME_SORT;
			default:
				return sortField;
		}
	}
}
