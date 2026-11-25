package service

import (
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/lastresorter/itr-xray/internal/database"
	"github.com/lastresorter/itr-xray/internal/database/model"
	"github.com/lastresorter/itr-xray/internal/xray"
)

// AddTuicTrafficBatch commits a journal batch and its receipt atomically. A
// retained journal can therefore be replayed after an ambiguous commit result.
func (s *InboundService) AddTuicTrafficBatch(id string, traffic []*xray.ClientTraffic) error {
	if id == "" {
		return errors.New("TUIC traffic batch has no ID")
	}
	return submitTrafficWrite(func() error {
		return database.GetDB().Transaction(func(tx *gorm.DB) error {
			result := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.TuicTrafficReceipt{ID: id})
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return nil
			}
			return s.addClientTraffic(tx, traffic)
		})
	})
}
