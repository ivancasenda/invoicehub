package com.app.invoice;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import org.apache.lucene.analysis.core.KeywordAnalyzer;
import org.hibernate.search.annotations.Normalizer;

import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.SortableField;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Indexed
@Entity
@Data
@NoArgsConstructor
public class Invoice {

	public static final String INVOICE_ID_FIELD = "invoiceID";
	public static final String STORE_NAME_FIELD = "storeName";
	public static final String DATETIME_FIELD = "datetime";
	public static final String INVOICE_ID_SORT = "invoiceIdSort";
	public static final String STORE_NAME_SORT = "storeNameSort";

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Field
	@Field(name = INVOICE_ID_SORT, normalizer = @Normalizer(impl = KeywordAnalyzer.class))
	@SortableField(forField = INVOICE_ID_SORT)
	@Column(unique = true)
	@NotBlank
	@Pattern(regexp = "^[a-zA-Z]{3}-[0-9_]{1,13}$")
	private String invoiceID;

	@Field(normalizer = @Normalizer(impl = KeywordAnalyzer.class))
	@SortableField
	@DateTimeFormat(iso = ISO.DATE_TIME)
	@NotNull
	private LocalDateTime datetime;

	@Field
	@Field(name = STORE_NAME_SORT, normalizer = @Normalizer(impl = KeywordAnalyzer.class))
	@SortableField(forField = STORE_NAME_SORT)
	private String storeName;

	private String invoiceNote;

	@OneToMany(cascade = { CascadeType.ALL }, fetch = FetchType.EAGER)
	@OrderColumn
	private List<Item> items;

	public Invoice(String invoiceID, LocalDateTime datetime, String storeName, String invoiceNote, List<Item> items) {
		this.invoiceID = invoiceID;
		this.datetime = datetime;
		this.storeName = storeName;
		this.invoiceNote = invoiceNote;
		this.items = items;
	}
}
